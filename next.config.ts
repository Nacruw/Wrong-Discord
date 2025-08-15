import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.stream-io-api.com",
      },
      {
        protocol: "https",
        hostname: "sm.ign.com",
      },
      {
        protocol: "https",
        hostname: "getstream.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
      },
            {
        protocol: "https",
        hostname: "ms.yugipedia.com",
      }

    ],
  },
};

export default nextConfig;
