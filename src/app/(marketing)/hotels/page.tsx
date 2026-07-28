import * as React from "react";
import { HotelsBrowse } from "@/components/marketing/hotels-browse";

export default function HotelsPage() {
  return (
    <React.Suspense fallback={null}>
      <HotelsBrowse />
    </React.Suspense>
  );
}
