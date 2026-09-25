import GoogleCampusMap from "../components/GoogleCampusMap";
import type { DriverTrackingSnapshot } from "../types";

interface MainContentProps {
  step: "idle" | "selecting" | "active" | "payment";
  eta: number;
  pickup?: string;
  dropoff?: string;
  driverName?: string;
  driverId?: string;
  vehicleType?: string;
  tripStartedAt?: number;
  onDestinationReached?: () => void;
  onTrackingUpdate?: (tracking: DriverTrackingSnapshot | null) => void;
}

export default function MainContent({
  step,
  eta,
  pickup = "",
  dropoff = "",
  driverName = "Mr. Balogun",
  driverId = "",
  vehicleType = "School Sedan",
  tripStartedAt,
  onDestinationReached,
  onTrackingUpdate,
}: MainContentProps) {
  return (
    <main className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 relative overflow-hidden">
        {/* Real-Time Google Maps Campus Tracking Engine */}
        <GoogleCampusMap
          step={step}
          pickup={pickup}
          dropoff={dropoff}
          driverName={driverName}
          driverId={driverId}
          vehicleType={vehicleType}
          etaMinutes={eta}
          tripStartedAt={tripStartedAt}
          onDestinationReached={onDestinationReached}
          onTrackingUpdate={onTrackingUpdate}
        />
      </div>
    </main>
  );
}
