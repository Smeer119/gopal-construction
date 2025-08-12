"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: {
    light: string;
    dark: string;
    alt: string;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  const { resolvedTheme } = useTheme();
  const imageSrc = resolvedTheme === "light" ? image.light : image.dark;

  return (
    <section
      className={cn(
        "bg-gradient-to-b from-background to-gray-50 dark:to-gray-900 text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "overflow-hidden"
      )}
    >
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4 animate-appear opacity-100">
            {actions.map((action, index) => (
              action && (
                <Button 
                  key={index} 
                  variant={action.variant || 'default'}
                  size="lg" 
                  className="flex items-center gap-2 min-w-[120px] justify-center"
                  asChild
                >
                  <a href={action.href}>
                    {action.icon}
                    <span>{action.text}</span>
                  </a>
                </Button>
              )
            )).filter(Boolean)}
          </div>

          {/* Image with Glow */}
          <div className="relative pt-12">
            <div className="relative w-full max-w-6xl mx-auto">
              <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={image.light}
                  alt={image.alt}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>
            </div>
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-1000"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
