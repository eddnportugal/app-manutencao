/**
 * Sistema de Efeitos de Transição de Página
 * Permite ao gestor escolher diferentes animações para virar páginas da revista
 */

import { Variants } from "framer-motion";

export type TransitionEffect = 
  | "flip"      // Virar página como livro
  | "slide"     // Deslizar horizontal
  | "fade"      // Dissolução suave
  | "curl"      // Enrolar página
  | "zoom"      // Aproximar/afastar
  | "cards"     // Empilhar cartas
  | "cube"      // Rotação 3D em cubo
  | "swing";    // Balançar porta

export interface TransitionConfig {
  id: TransitionEffect;
  name: string;
  description: string;
  icon: string;
  duration: number;
  variants: {
    enter: (direction: number) => Variants["initial"];
    center: Variants["animate"];
    exit: (direction: number) => Variants["exit"];
  };
}

// Efeito Flip - Virar página como livro real
export const flipTransition: TransitionConfig = {
  id: "flip",
  name: "Virar Página",
  description: "Efeito clássico de virar página como um livro real",
  icon: "📖",
  duration: 0.6,
  variants: {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.9,
      transformOrigin: direction > 0 ? "left center" : "right center",
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transformOrigin: "center center",
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.9,
      transformOrigin: direction > 0 ? "right center" : "left center",
    }),
  },
};

// Efeito Slide - Deslizar horizontal
export const slideTransition: TransitionConfig = {
  id: "slide",
  name: "Deslizar",
  description: "Transição suave deslizando para o lado",
  icon: "↔️",
  duration: 0.4,
  variants: {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  },
};

// Efeito Fade - Dissolução suave
export const fadeTransition: TransitionConfig = {
  id: "fade",
  name: "Dissolução",
  description: "Transição suave com fade in/out elegante",
  icon: "✨",
  duration: 0.5,
  variants: {
    enter: () => ({
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: () => ({
      opacity: 0,
      scale: 1.05,
    }),
  },
};

// Efeito Curl - Enrolar página
export const curlTransition: TransitionConfig = {
  id: "curl",
  name: "Enrolar",
  description: "Página enrola como papel sendo virado",
  icon: "📃",
  duration: 0.7,
  variants: {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 45 : -45,
      rotateX: 10,
      x: direction > 0 ? "50%" : "-50%",
      opacity: 0,
      scale: 0.8,
      transformOrigin: direction > 0 ? "left center" : "right center",
    }),
    center: {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -45 : 45,
      rotateX: -10,
      x: direction > 0 ? "-50%" : "50%",
      opacity: 0,
      scale: 0.8,
      transformOrigin: direction > 0 ? "right center" : "left center",
    }),
  },
};

// Efeito Zoom - Aproximar/afastar
export const zoomTransition: TransitionConfig = {
  id: "zoom",
  name: "Zoom",
  description: "Páginas aproximam e afastam com elegância",
  icon: "🔍",
  duration: 0.5,
  variants: {
    enter: (direction: number) => ({
      scale: direction > 0 ? 0.5 : 1.5,
      opacity: 0,
      filter: "blur(10px)",
    }),
    center: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      scale: direction > 0 ? 1.5 : 0.5,
      opacity: 0,
      filter: "blur(10px)",
    }),
  },
};

// Efeito Cards - Empilhar cartas
export const cardsTransition: TransitionConfig = {
  id: "cards",
  name: "Cartas",
  description: "Páginas empilham como cartas de baralho",
  icon: "🃏",
  duration: 0.5,
  variants: {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      y: 50,
      rotate: direction > 0 ? 15 : -15,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      y: -50,
      rotate: direction > 0 ? -15 : 15,
      opacity: 0,
      scale: 0.9,
    }),
  },
};

// Efeito Cube - Rotação 3D em cubo
export const cubeTransition: TransitionConfig = {
  id: "cube",
  name: "Cubo 3D",
  description: "Rotação tridimensional como faces de um cubo",
  icon: "🎲",
  duration: 0.6,
  variants: {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      x: direction > 0 ? "50%" : "-50%",
      opacity: 0,
      scale: 0.8,
      z: -200,
    }),
    center: {
      rotateY: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      z: 0,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      x: direction > 0 ? "-50%" : "50%",
      opacity: 0,
      scale: 0.8,
      z: -200,
    }),
  },
};

// Efeito Swing - Balançar como porta
export const swingTransition: TransitionConfig = {
  id: "swing",
  name: "Porta",
  description: "Página abre como uma porta balançando",
  icon: "🚪",
  duration: 0.6,
  variants: {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
      transformOrigin: direction > 0 ? "right center" : "left center",
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      transformOrigin: "center center",
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      transformOrigin: direction > 0 ? "left center" : "right center",
    }),
  },
};

// Lista de todas as transições disponíveis
export const transitions: TransitionConfig[] = [
  flipTransition,
  slideTransition,
  fadeTransition,
  curlTransition,
  zoomTransition,
  cardsTransition,
  cubeTransition,
  swingTransition,
];

// Função para obter uma transição pelo ID
export function getTransitionById(id: TransitionEffect): TransitionConfig {
  return transitions.find((t) => t.id === id) || flipTransition;
}

// Função para gerar as variantes do Framer Motion
export function getMotionVariants(
  transition: TransitionConfig,
  direction: number
) {
  return {
    initial: transition.variants.enter(direction),
    animate: transition.variants.center,
    exit: transition.variants.exit(direction),
    transition: {
      duration: transition.duration,
      ease: [0.4, 0, 0.2, 1],
    },
  };
}

// Transição padrão
export const defaultTransition: TransitionEffect = "flip";
