import Head from 'next/head';
import World from '/components/world';

export default function Home() {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="favicon.ico"/>
      </Head>
      <main>
        <World/>
      </main>
    </>
  );
}