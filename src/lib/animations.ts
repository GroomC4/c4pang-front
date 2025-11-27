import { Variants } from 'framer-motion'

// 페이드 인 애니메이션
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// 스태거 컨테이너 (자식 요소들을 순차적으로 애니메이션)
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// 스케일 애니메이션
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

// 슬라이드 인 (좌측에서)
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// 슬라이드 인 (우측에서)
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 50
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// 플로팅 애니메이션 (위아래로 떠다니는 효과)
export const floating: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// 펄스 애니메이션
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// 회전 애니메이션
export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// 호버 효과
export const hoverLift = {
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98
  }
}

// 카드 호버 효과
export const cardHover = {
  hover: {
    y: -10,
    scale: 1.03,
    rotateY: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

// 버튼 호버 효과
export const buttonHover = {
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
}

// 텍스트 타이핑 효과용 설정
export const typingContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.04
    }
  }
}

export const typingChar: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.05
    }
  }
}

// 뷰포트 기반 애니메이션 설정
export const viewportSettings = {
  once: true,
  margin: "-100px"
}

// 페이지 전환 애니메이션
export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
}

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
}

// 모달/오버레이 애니메이션
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
}

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.3
    }
  }
}