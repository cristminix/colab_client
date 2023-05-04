import '@/styles/globals.css'
import Script from 'next/script'
import Head from "next/head";
export default function App({ Component, pageProps }) {
  
  return (
    <>
    <Head> 
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"/>
      <Script id="bootstrap-cdn" src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" />
    </Head>
    <Component {...pageProps} />

    </>
  )
}
