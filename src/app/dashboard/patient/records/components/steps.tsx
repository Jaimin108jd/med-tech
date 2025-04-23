// Stepper.tsx
import { Button } from "@/components/ui/button";
import React from "react";
import { useState } from "react";


interface StepProps {
  children: React.ReactNode;
}

interface StepperProps {
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  children: React.ReactNode;
}

export const Step = ({ children }: StepProps) => {
  return <div>{children}</div>;
};

export const Stepper = ({
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Previous",
  nextButtonText = "Next",
  children,
}: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = React.Children.toArray(children);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    } else {
      onFinalStepCompleted?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  return (
    <div>
      {steps[currentStep - 1]}
      <div className="flex justify-between mt-4">
        <Button onClick={handleBack} disabled={currentStep === 1}>
          {backButtonText}
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length ? "Finish" : nextButtonText}
        </Button>
      </div>
    </div>
  );
};
