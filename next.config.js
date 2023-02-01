/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects : async () =>{
    return [
      {
        source: '/p/:path*',
        destination: '/api/proxy/p?url=:path*',
        permanent: true,
      },
    ]
  }

}

 
module.exports = nextConfig
