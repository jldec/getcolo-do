import { Container, getContainer } from '@cloudflare/containers'

type Colo = Record<string, string | number>

export class MyDurableObject extends Container<Env> {
  // Port the container listens on
  defaultPort = 8080
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = '2m'
  // Environment variables passed to the container

  constructor(ctx: DurableObjectState<Env>, env: Env) {
    super(ctx, env)
  }

  async getColo(coloName: string): Promise<Colo> {
    return await getColo(coloName)
  }
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    console.log(req.method, req.url)
    const url = new URL(req.url)
    const pathname = url.pathname
    const coloName = pathname.slice(1)
    try {
      if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })
      if (pathname === '/') return new Response(`Hello from ${url.origin}`)
      // Check if valid DNS hostname: RFC 1123, no dots, 1-63 chars, alphanum or hyphen, not start/end with hyphen
      // This also catches requests for favicon etc.
      if (!/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/.test(coloName))
        throw new Error(`Invalid colo hostname ${coloName}`)

      const coloLocal = await getColo(coloName)

      // default to city for DOName - override with 'do' query param.
      const DOName =
        url.searchParams.get('do') ||
        req.cf?.city ||
        req.cf?.region ||
        req.cf?.country ||
        url.hostname
      const id = env.MY_DURABLE_OBJECT.idFromName(DOName)
      const stub = env.MY_DURABLE_OBJECT.get(id)

      const startDOCall = Date.now()
      const coloDO = await stub.getColo(coloName)
      coloDO['DOName'] = DOName
      coloDO['DOFetchTime'] = Date.now() - startDOCall

      const startContainerCall = Date.now()
      const resp = await stub.fetch(req)
      const coloContainer = (await resp.json()) as Colo
      coloContainer['ContainerFetchTime'] = Date.now() - startContainerCall

      return new Response(JSON.stringify({ coloLocal, coloDO, coloContainer }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (e) {
      console.log(`400 ${e}`)
      return new Response(`${e}`, { status: 400 })
    }
  }
} satisfies ExportedHandler<Env>

/**
 * GET colo JSON  with timing from `https://${coloName}.jldec.me/getcolo`
 * Possibilities for coloName include:
 * - getcolo.jldec.me: closest worker to this server
 * - geo.jldec.me: server resolved by shared tunnel endpoint
 * - <instance-name>.jldec.me: server in a specific city
 *
 * @param coloName - subdomain of jldec.me to query
 */
async function getColo(coloName: string): Promise<Colo> {
  const url = `https://${coloName}.jldec.me/getcolo`
  const start = Date.now()
  let resp: Response | undefined
  try {
    resp = await fetch(url)
  } catch (e) {
    throw new Error(`${url}: ${e}`)
  }
  if (!resp.ok) throw new Error(`Status ${resp.status} fetching ${url}`)
  let colo: Colo
  try {
    colo = (await resp.json()) as Colo
  } catch (e) {
    throw new Error(`Error parsing JSON from ${url}: ${e}`)
  }
  colo[coloName + 'FetchTime'] = Date.now() - start
  return colo
}
