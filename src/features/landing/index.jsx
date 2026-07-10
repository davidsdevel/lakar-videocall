import CTA from "./cta";
import Features from "./features";
import Footer from "./footer";
import Header from "./header";
import Technologies from "./technologies";

export default function Home() {
	return (
		<div>
			<Header />
			<Features />
			<Technologies />
			<CTA />
			<Footer />
		</div>
	);
}
