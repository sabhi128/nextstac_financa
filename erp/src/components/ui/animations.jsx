export const pageVariants = {
    initial: {
        opacity: 0,
        y: 5, // Reduced from 10
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3, // Slightly faster
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        y: -5,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    },
};

export const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: "easeOut",
        },
    }),
};

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.15,
            ease: "easeIn",
        },
    },
};

export const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    },
};

export const buttonHover = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
};
