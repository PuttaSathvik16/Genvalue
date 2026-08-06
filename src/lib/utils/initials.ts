/**
 * Generate initials from a name
 * @param name - Full name of the user
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(' ').filter(Boolean);
  
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  // Take first letter of first name and first letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color based on name using GenValue brand colors
 * @param name - User name
 * @returns Tailwind gradient class with GenValue theme
 */
export function getAvatarColor(name: string): string {
  const colors = [
    // Primary GenValue colors
    'bg-gradient-to-br from-[#1E3FE0] to-[#60A5FA]', // GenValue Blue
    'bg-gradient-to-br from-[#E8622E] to-[#FF8C42]', // GenValue Orange
    
    // Complementary gradient variations
    'bg-gradient-to-br from-[#1E3FE0] to-[#E8622E]', // Blue to Orange
    'bg-gradient-to-br from-purple-600 to-purple-400',
    'bg-gradient-to-br from-pink-600 to-pink-400',
    'bg-gradient-to-br from-red-600 to-red-400',
    'bg-gradient-to-br from-teal-600 to-teal-400',
    'bg-gradient-to-br from-cyan-600 to-cyan-400',
    'bg-gradient-to-br from-indigo-600 to-indigo-400',
    'bg-gradient-to-br from-violet-600 to-violet-400',
  ];
  
  // Generate consistent color based on name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}
