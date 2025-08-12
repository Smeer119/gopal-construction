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
    <section className="relative overflow-hidden py-16 sm:py-24 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent dark:from-blue-900/20 dark:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent dark:from-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent dark:from-emerald-900/20" />
        
        {/* Animated glow effect */}
        <div className="absolute -top-1/2 -left-1/4 w-[200%] h-[200%] bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-900/10 dark:to-purple-900/10 animate-[spin_30s_linear_infinite]" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-50 dark:opacity-30" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
               backgroundSize: '60px 60px',
               backgroundRepeat: 'repeat'
             }} 
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
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
