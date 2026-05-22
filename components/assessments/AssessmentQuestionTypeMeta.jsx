import { HiOutlineChatBubbleBottomCenterText, HiOutlineCommandLine, HiOutlineListBullet } from 'react-icons/hi2';

// Shared type and difficulty presentation for question rows and previews.
export const TYPE_META = {
    coding: { label: 'Coding', icon: HiOutlineCommandLine },
    mcq: { label: 'Multiple choice', icon: HiOutlineListBullet },
    subjective: { label: 'Written', icon: HiOutlineChatBubbleBottomCenterText },
};

// Same colors as the shared DIFFICULTY_COLORS (easy emerald, medium yellow, hard red), mapped to Badge tones.
export const DIFFICULTY_TONE = {
    easy: 'emerald',
    medium: 'yellow',
    hard: 'red',
};
