# getcolo-do
This worker calls [getcolo.jldec.me](https://github.com/jldec/getcolo/blob/main/src/index.js) from the worker, from its durable object, and from its container.

Deployed at https://getcolo-do.jldec.me/getcolo

### AWS Tokyo
```json
{
  "coloLocal": {
    "colo": "NRT",
    "city": "Tokyo",
    "region": "Tokyo",
    "country": "JP",
    "continent": "AS",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 12
  },
  "coloDO": {
    "colo": "KIX",
    "city": "Osaka",
    "region": "Osaka",
    "country": "JP",
    "continent": "AS",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 5,
    "DOName": "Tokyo",
    "DOFetchTime": 22
  },
  "coloContainer": {
    "city": "Manukau City",
    "colo": "AKL",
    "continent": "OC",
    "country": "NZ",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 10,
    "region": "Auckland",
    "ContainerFetchTime": 433
  },
  "getcolo-do": "https://getcolo-do.jldec.me/getcolo",
  "getcolo-doFetchTime": 475
}
```

### AWS Dublin
```json
{
  "coloLocal": {
    "colo": "DUB",
    "city": "Dublin",
    "region": "Leinster",
    "country": "IE",
    "continent": "EU",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 14
  },
  "coloDO": {
    "colo": "LHR",
    "city": "London",
    "region": "England",
    "country": "GB",
    "continent": "EU",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 19,
    "DOName": "Dublin",
    "DOFetchTime": 41
  },
  "coloContainer": {
    "city": "Montijo",
    "colo": "LIS",
    "continent": "EU",
    "country": "PT",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 10,
    "region": "Setúbal",
    "ContainerFetchTime": 107
  },
  "getcolo-do": "https://getcolo-do.jldec.me/getcolo",
  "getcolo-doFetchTime": 169
}
```

### AWS Capetown

```json
{
  "coloLocal": {
    "colo": "MAD",
    "city": "Cape Town",
    "region": "Western Cape",
    "country": "ZA",
    "continent": "AF",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 17
  },
  "coloDO": {
    "colo": "MRS",
    "city": "Marseille",
    "region": "Provence-Alpes-Côte d'Azur",
    "country": "FR",
    "continent": "EU",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 9,
    "DOName": "Cape Town",
    "DOFetchTime": 36
  },
  "coloContainer": {
    "city": "Minneapolis",
    "colo": "MSP",
    "continent": "NA",
    "country": "US",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 11,
    "region": "Minnesota",
    "ContainerFetchTime": 281
  },
  "getcolo-do": "https://getcolo-do.jldec.me/getcolo",
  "getcolo-doFetchTime": 492
}
```

### AWS us-east-2
```json
{
  "coloLocal": {
    "colo": "ORD",
    "city": "Columbus",
    "region": "Ohio",
    "country": "US",
    "continent": "NA",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 14
  },
  "coloDO": {
    "colo": "ORD",
    "city": "Chicago",
    "region": "Illinois",
    "country": "US",
    "continent": "NA",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 12,
    "DOName": "Columbus",
    "DOFetchTime": 22
  },
  "coloContainer": {
    "city": "Kent",
    "colo": "SEA",
    "continent": "NA",
    "country": "US",
    "getcolo": "https://getcolo.jldec.me/getcolo",
    "getcoloFetchTime": 10,
    "region": "Washington",
    "ContainerFetchTime": 120
  },
  "getcolo-do": "https://getcolo-do.jldec.me/getcolo",
  "getcolo-doFetchTime": 178
}
```
