import { serve } from '@rivethub/plugin-sdk'
import { Voice } from './voice.ts'

const voice = new Voice()

await serve({
  http: {
    transcribe: (request) => voice.transcribe(request),
    speak: (request) => voice.speak(request),
  },
  settings: (values) => voice.configure(values),
})
