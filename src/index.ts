import { DurableObject } from 'cloudflare:workers'
import { Container, getContainer } from '@cloudflare/containers'

type Colo = Record<string, string | number>

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class MyDurableObject extends DurableObject<Env> {
  // RPC to getcolo from this durable object
  async getColo(coloName: string): Promise<Colo> {
    return await getColoFetcher(coloName)
  }
}

export class MyContainerObject extends Container<Env> {
  // container listens on
  defaultPort = 8080
  name = 'unknown'
  // Optional lifecycle hooks
  override onStart() {
    console.log(`Container ${this.name} started`)
  }
  override onStop() {
    console.log(`Container ${this.name} shut down`)
  }
  override onError(error: unknown) {
    console.log(`Container ${this.name} error: ${error}`)
  }
  // RPC to getcolo from this durable object
  async getColo(coloName: string): Promise<Colo> {
    return await getColoFetcher(coloName)
  }
  async getContainerName(): Promise<string> {
    return this.name
  }
  async setContainerName(name: string): Promise<void> {
    this.name = name
  }
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })
    const url = new URL(req.url)

    // default to 'getcolo.jldec.me' for getColo endpoint (see getColoFetcher)
    let coloName: string
    if (url.pathname === '/') {
      coloName = 'getcolo'
    } else {
      coloName = url.pathname.slice(1)
      // Check if valid DNS hostname: RFC 1123, no dots, 1-63 chars, alphanum or hyphen, not start/end with hyphen
      // This also catches requests for favicon etc.
      if (!/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/.test(coloName)) {
        return new Response(`Bad request /${coloName}`, { status: 400 })
      }
    }

    // default to cf.colo for DOName - override with 'do' or 'DO' query param suffix
    let DOName = req.cf?.colo || url.hostname
    const overrideDOName = url.searchParams.get('do') || url.searchParams.get('DO')
    if (overrideDOName) {
      DOName += `-${overrideDOName}`
    }

    try {
      // TODO: make getColo fetches in parallel
      const coloLocal = await getColoFetcher(coloName)

      // default to DO _without_ container
      // use 'do' search param to override non-container DOName e.g. 'getcolo-do?do=42'
      // use 'DO' search param to force container DO e.g. 'getcolo-do?DO' or 'getcolo-do?DO=43'
      if (!url.searchParams.has('DO')) {
        const startDO = Date.now()
        const id = env.MY_DURABLE_OBJECT.idFromName(DOName)
        const stub = env.MY_DURABLE_OBJECT.get(id)
        const getIdTime = Date.now() - startDO
        await sleep(1000)
        const startDOCall = Date.now()
        const coloDO = await stub.getColo(coloName) // may return {error}
        coloDO['DOFetchTime'] = Date.now() - startDOCall
        coloDO['DOGetIdTime'] = getIdTime
        coloDO['DOName'] = `MyDurableObject ${DOName}`
        return json({ coloLocal, coloDO })
      }

      // container DO
      const startDOCall = Date.now()
      const id = env.MY_CONTAINER_OBJECT.idFromName(DOName)
      const stub = env.MY_CONTAINER_OBJECT.get(id)
      const getIdTime = Date.now() - startDOCall
      await stub.setContainerName(DOName)

      // RPC call getColo from container DO
      const coloDO = await stub.getColo(coloName) // may return {error}
      coloDO['DOFetchTime'] = Date.now() - startDOCall
      coloDO['DOGetIdTime'] = getIdTime
      coloDO['DOName'] = `MyContainerObject ${DOName}`

      // return response if DO query param value is empty
      if (url.searchParams.get('DO') === '') {
        return json({ coloLocal, coloDO })
      }

      // call container only if DO query param value is non empty
      const startContainerCall = Date.now()
      const containerUrl = `${url.origin}/${coloName}${url.search}`
      const resp = await stub.fetch(containerUrl)
      let coloContainer: Colo | undefined
      if (!resp.ok) {
        coloContainer = {
          error: `${resp.status} fetching ${containerUrl} from container: ${await resp.text()}`
        }
      } else {
        coloContainer = (await resp.json()) as Colo
      }
      coloContainer['ContainerFetchTime'] = Date.now() - startContainerCall
      return json({ coloLocal, coloDO, coloContainer })
    } catch (e) {
      console.log(`${e}`)
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
 * @returns Colo object with timing information or { error }
 */
async function getColoFetcher(coloName: string): Promise<Colo> {
  const url = `https://${coloName}.jldec.me/getcolo`
  const start = Date.now()
  let resp: Response | undefined
  try {
    resp = await fetch(url)
  } catch (e) {
    return { error: `cannot fetch ${url}: ${e}` }
  }
  if (!resp.ok) return { error: `${resp.status} fetching ${url}` }
  let colo: Colo
  try {
    colo = (await resp.json()) as Colo
  } catch (e) {
    return { error: `error parsing JSON from ${url}: ${e}` }
  }
  colo[coloName + 'FetchTime'] = Date.now() - start
  return colo
}

/** helper to return JSON response with logging */
function json(returnVal: any) {
  // console.log(returnVal)
  return new Response(JSON.stringify(returnVal, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  })
}
