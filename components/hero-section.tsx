"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant | 'glow';
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
    <section className="bg-white dark:bg-gray-900 py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="mb-6">
              {badge.text}
              <a href={badge.action.href} className="ml-2 flex items-center text-blue-600 dark:text-blue-400">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {title}
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {description}
          </p>

          {/* Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {actions.map((action, index) => {
              if (!action) return null;
              
              const isGlow = action.variant === 'glow';
              const buttonVariant = (isGlow ? 'default' : action.variant) as ButtonVariant;
              
              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  size="lg"
                  className={isGlow ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200' : ''}
                  asChild
                >
                  <a href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </a>
                </Button>
              );
            })}
          </div>

          {/* Image */}
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src={image.light}
                alt={image.alt}
                className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
