import { serve } from '@rivethub/plugin-sdk'
import { Files } from './files.ts'

const files = new Files()

await serve({
  http: {
    list: (request) => files.list(request),
    download: (request) => files.download(request),
    upload: (request) => files.upload(request),
    mkdir: (request) => files.mkdir(request),
    rename: (request) => files.rename(request),
    delete: (request) => files.delete(request),
  },
  settings: (values) => files.configure(values),
})
