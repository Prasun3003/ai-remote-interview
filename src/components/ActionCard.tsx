import { QuickActionType } from "@/constants";
import { Card } from "./ui/card";

// some weird tw bug, but this is how it works
// from-orange-500/10 via-orange-500/5 to-transparent
// from-blue-500/10 via-blue-500/5 to-transparent
// from-purple-500/10 via-purple-500/5 to-transparent
// from-primary/10 via-primary/5 to-transparent

function ActionCard({
  action,
  onClick,
}: {
  action: QuickActionType;
  onClick: () => void;
}) {
  return (
    <Card
      className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      {/* ACTION GRADIENT */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-100 group-hover:opacity-50 transition-opacity`}
      />

      {/* ACTION CONTENT WRAPPER */}
      <div className="relative p-8 size-full">
        <div className="space-y-4">
          {/* ACTION ICON */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center bg-${action.color}/10 group-hover:scale-110 transition-transform`}
          >
            <action.icon className={`h-7 w-7 text-${action.color}`} />
          </div>

          {/* ACTION DETAILS */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ActionCard;
