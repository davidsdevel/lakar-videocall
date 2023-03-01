import Header from '@/components/index/header';
import Features from '@/components/index/features';
import Technologies from '@/components/index/technologies';
import CTA from '@/components/index/cta';
import Footer from '@/components/footer';
import Nav from '@/components/nav';

export default function Home() {
  return <div>
    <Nav/>
    <Header/>
    <Features/>
    <Technologies/>
    <CTA/>
    <Footer/>
  </div>;
};
