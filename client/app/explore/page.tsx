import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export default function ExplorePage() {
  return (
    <Suspense fallback={<p className="text-center mt-5">Loading...</p>}>
      <ExploreClient />
    </Suspense>
  );
}
