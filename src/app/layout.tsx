import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Uttarakhand Getaways',
  description: 'Book your dream vacation in the serene landscapes of Uttarakhand.',
  verification: {
    google: 'uSMZHft5F59dnUNX-BIOV1RKGpmaIg7yxpiBmKRBSas',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(e,t,a,n,g){e[n]=e[n]||[],e[n].push({"gtm.start":(new Date).getTime(),event:"gtm.js"});var m=t.getElementsByTagName(a)[0],r=t.createElement(a);r.async=!0,r.src="https://www.googletagmanager.com/gtm.js?id=GTM-M26M84QX",m.parentNode.insertBefore(r,m)}(window,document,"script","dataLayer")`,
          }}
        />

        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WRNC019FWH"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","G-WRNC019FWH")`,
          }}
        />

        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(e,t,n,c,o,a,f){e.fbq||(o=e.fbq=function(){o.callMethod?o.callMethod.apply(o,arguments):o.queue.push(arguments)},e._fbq||(e._fbq=o),o.push=o,o.loaded=!0,o.version="2.0",o.queue=[],(a=t.createElement(n)).async=!0,a.src="https://connect.facebook.net/en_US/fbevents.js",(f=t.getElementsByTagName(n)[0]).parentNode.insertBefore(a,f))}(window,document,"script"),fbq("init","4579444228946327"),fbq("track","PageView")`,
          }}
        />

        {/* Quora Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(e,t,n,c,p,a){e.qp||((c=e.qp=function(){c.qp?c.qp.apply(c,arguments):c.queue.push(arguments)}).queue=[],(p=document.createElement(t)).async=!0,p.src="https://a.quora.com/qevents.js",(a=document.getElementsByTagName(t)[0]).parentNode.insertBefore(p,a))}(window,"script"),qp("init","b9ba5b26033d4e52a8ce76c07e396efb"),qp("track","ViewContent")`,
          }}
        />

        {/* Outbrain Pixel */}
        <script
          data-obct
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `!function(e,t){var r="00f8045b8edc6452285e5c4c9047e93de8";if(e.obApi){var c=function(e){return"[object Array]"===Object.prototype.toString.call(e)?e:[e]};e.obApi.marketerId=c(e.obApi.marketerId).concat(c(r))}else{var a=e.obApi=function(){a.dispatch?a.dispatch.apply(a,arguments):a.queue.push(arguments)};a.version="1.1",a.loaded=!0,a.marketerId=r,a.queue=[];var o=t.createElement("script");o.async=!0,o.src="//amplify.outbrain.com/cp/obtp.js",o.type="text/javascript";var n=t.getElementsByTagName("script")[0];n.parentNode.insertBefore(o,n)}}(window,document),obApi("track","PAGE_VIEW",{content:{id:"XXXXX"},contentType:"product"})`,
          }}
        />

        {/* LinkedIn Insight Tag */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `_linkedin_partner_id="4634545",window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[],window._linkedin_data_partner_ids.push(_linkedin_partner_id)`,
          }}
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `!function(n){window.lintrk||(window.lintrk=function(n,t){window.lintrk.q.push([n,t])},window.lintrk.q=[]);var t=document.getElementsByTagName("script")[0],i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src="https://snap.licdn.com/li.lms-analytics/insight.min.js",t.parentNode.insertBefore(i,t)}()`,
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M26M84QX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=4579444228946327&ev=PageView&noscript=1"
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://q.quora.com/_/ad/b9ba5b26033d4e52a8ce76c07e396efb/pixel?tag=ViewContent&noscript=1"
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src="https://px.ads.linkedin.com/collect/?pid=4634545&fmt=gif"
          />
        </noscript>

        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </FirebaseClientProvider>

        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <Script src="https://www.paypal.com/sdk/js?client-id=AW492_KYnpYLPxEBAb7et69CcwhpKHoDO-LAzfa1yDqSFIpu8RS1WenbsAgvbEEFpa189s6AcARUQeXZ&currency=EUR" />
      </body>
    </html>
  );
}
