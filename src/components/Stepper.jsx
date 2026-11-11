import React from 'react';
import { Check } from 'lucide-react';

export default function Stepper({ currentStep }) {
  const steps = [
    { id: 1, label: 'Select Items' },
    { id: 2, label: 'Destination' },
    { id: 3, label: 'Review' }
  ];

  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isFuture = currentStep < step.id;

        let stepClass = 'stepper-item';
        if (isActive) stepClass += ' active';
        else if (isCompleted) stepClass += ' completed';
        else stepClass += ' future';

        return (
          <div key={step.id} className={stepClass}>
            <div className="stepper-content">
              {isCompleted ? (
                <span className="step-circle completed-circle">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : (
                <span className={`step-circle ${isActive ? 'active-circle' : 'future-circle'}`}>
                  {step.id}
                </span>
              )}
              <span className="step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className="step-chevron-edge" />}
          </div>
        );
      })}
    </div>
  );
}

