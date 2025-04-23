import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface StepperProps {
  steps: StepProps[];
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  stepClassName?: string;
  connectorClassName?: string;
  onStepClick?: (step: number) => void;
}

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StepProps
>(
  (
    { title, description, icon, isCompleted, isActive, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
            isActive && "border-primary bg-primary text-primary-foreground",
            isCompleted && "border-primary bg-primary text-primary-foreground",
            !isActive &&
              !isCompleted &&
              "border-muted-foreground/20 bg-background text-muted-foreground"
          )}
        >
          {isCompleted ? (
            <Check className="h-5 w-5" />
          ) : icon ? (
            icon
          ) : (
            <span>{props["aria-label"]}</span>
          )}
        </div>
        {(title || description) && (
          <div className="mt-2 text-center">
            {title && (
              <div
                className={cn(
                  "text-sm font-medium",
                  isActive && "text-foreground",
                  !isActive && "text-muted-foreground"
                )}
              >
                {title}
              </div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
        )}
      </div>
    );
  }
);
Step.displayName = "Step";

const StepConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
    isActive?: boolean;
    isCompleted?: boolean;
  }
>(
  (
    { orientation = "horizontal", isActive, isCompleted, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1",
          orientation === "horizontal" && "h-[1px] self-center",
          orientation === "vertical" && "w-[1px] self-center",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full",
            isCompleted ? "bg-primary" : "bg-muted-foreground/20"
          )}
        />
      </div>
    );
  }
);
StepConnector.displayName = "StepConnector";

const Stepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StepperProps
>(
  (
    {
      steps,
      activeStep,
      orientation = "horizontal",
      variant = "default",
      size = "default",
      className,
      stepClassName,
      connectorClassName,
      onStepClick,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full",
          orientation === "horizontal" && "flex-row",
          orientation === "vertical" && "flex-col space-y-4",
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <React.Fragment key={index}>
              <Step
                {...step}
                aria-label={String(index + 1)}
                isActive={isActive}
                isCompleted={isCompleted}
                className={cn("cursor-pointer", stepClassName)}
                onClick={() => onStepClick?.(index)}
              />
              {index < steps.length - 1 && (
                <StepConnector
                  orientation={orientation}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  className={connectorClassName}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);
Stepper.displayName = "Stepper";

export { Stepper, Step, StepConnector };
