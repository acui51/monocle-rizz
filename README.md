# rizzGPT

A hack built at the AGI House GPT Hackathon that gives real-time Charisma as a service (CaaS), and tells you exactly what to say.

Demo: https://twitter.com/bryanhpchiang/status/1639830383616487426?s=20

Built with @bryanhpchiang, @4gatepylon, and @varunshenoy and using Next.js, Open AI, and Brilliant Monocle 

## Setup
Copy the `.env.example` file into `.env.local` at the root level and paste in your Open AI key. ***WARNING*** this is a NEXT_PUBLIC key so it will be exposed to the browser. Read more here: https://nextjs.org/docs/basic-features/environment-variables. 

Run `yarn install` to install deps.

Run `yarn dev` to start the app.

## Acknowledgements

Thanks to this repo for guiding us in setting up the Bluetooth connection with the Monocle and how to send instructions to control it: https://github.com/jdc-cunningham/bl-monocle-reactjs-pwa/tree/workout-app
