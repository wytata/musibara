This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installing Dependencies

The client application requires a variety of dependencies. To install them, execute the following command:
```bash
npm install
```

## Environment Setup
In order to run the client application, you must define the following environment variables (this can be done by setting the variables in a .env.local file at the top of the musibara-client subdirectory):

```bash
NEXT_PUBLIC_API_URL="YOUR_API_URL"
NEXT_PUBLIC_SPOTIFY_ID="YOUR_SPOTIFY_ID"
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI="YOUR_SPOTIFY_REDIRECT_URI"
SPOTIFY_SECRET="YOUR_SPOTIFY_SECRET"
```

## Running the Server

To run the development server, execute the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
