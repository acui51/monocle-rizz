import "antd/dist/reset.css";
import dynamic from "next/dynamic";

const HomeNotSsr = dynamic(() => import("../components/HomeNotSsr"), {
  ssr: false,
});

export default function Home() {
  return <HomeNotSsr />;
}
