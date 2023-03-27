import "antd/dist/reset.css";
import dynamic from "next/dynamic";

const HomeNotSsr = dynamic(() => import("../components/Home"), {
  ssr: false,
});

export default function Home() {
  return <HomeNotSsr />;
}
