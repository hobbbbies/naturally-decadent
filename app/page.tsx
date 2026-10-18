import homeMarkup from "@/content/home.html?raw";

const homeBody = homeMarkup.match(/<body>([\s\S]*)<\/body>/)?.[1] || "";

export default function HomePage() {
  return <><link rel="stylesheet" href="/home.css" /><div dangerouslySetInnerHTML={{__html:homeBody}} /></>;
}
