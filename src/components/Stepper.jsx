import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 border-2",
                    isCompleted && "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))] text-white",
                    isCurrent && "border-[hsl(var(--color-primary))] bg-white text-[hsl(var(--color-primary))]",
                    !isCompleted && !isCurrent && "border-[hsl(var(--color-border))] bg-white text-[hsl(var(--color-muted-foreground))]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-[hsl(var(--color-primary))]",
                      isCompleted && "text-[hsl(var(--color-foreground))]",
                      !isCompleted && !isCurrent && "text-[hsl(var(--color-muted-foreground))]"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-[hsl(var(--color-muted-foreground))] mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 mb-8">
                  <div
                    className={cn(
                      "h-full transition-all duration-200",
                      isCompleted
                        ? "bg-[hsl(var(--color-primary))]"
                        : "bg-[hsl(var(--color-border))]"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export { Stepper }

