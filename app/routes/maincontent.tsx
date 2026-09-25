import GoogleCampusMap from "../components/GoogleCampusMap";

interface MainContentProps {
  step: "idle" | "selecting" | "active" | "payment";
  eta: number;
  pickup?: string;
  dropoff?: string;
  driverName?: string;
  vehicleType?: string;
  onDestinationReached?: () => void;
}

export default function MainContent({
  step,
  eta,
  pickup = "",
  dropoff = "",
  driverName = "Mr. Balogun",
  vehicleType = "School Sedan",
  onDestinationReached,
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
          vehicleType={vehicleType}
          etaMinutes={eta}
          onDestinationReached={onDestinationReached}
        />
      </div>
    </main>
  );
}
