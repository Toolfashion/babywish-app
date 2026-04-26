/**
 * BACKUP - 7-Day Rotating Background Program
 * ==========================================
 * This file contains the original 7-day rotating beach photo backgrounds.
 * Each day of the week shows a different romantic couple beach photo.
 * 
 * To restore: Copy the dayBackgrounds array and related code back to StarField.jsx
 * 
 * SAVED: 26 April 2026
 */

// 7 beautiful beach photos - one for each day of the week
export const dayBackgrounds = [
  // Sunday (0) - Silhouette couple on beach at golden hour
  "https://images.unsplash.com/photo-1566942482387-e8dc927e5829?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
  // Monday (1) - Couple at sunset with dramatic sky
  "https://images.unsplash.com/photo-1771598570855-0421b0533184?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwzfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
  // Tuesday (2) - Two people walking on tranquil beach with chapel
  "https://images.pexels.com/photos/33792345/pexels-photo-33792345.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  // Wednesday (3) - Couple walking at sunset with reflective shoreline
  "https://images.pexels.com/photos/32645048/pexels-photo-32645048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  // Thursday (4) - Couple on beach wide view
  "https://images.unsplash.com/photo-1652096540895-476d7a710e9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
  // Friday (5) - Purple/pink sky with couple silhouette
  "https://images.unsplash.com/photo-1691683931140-97c696a257a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwyfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
  // Saturday (6) - Romantic Maldives beach sunset with couple
  "https://images.pexels.com/photos/34260948/pexels-photo-34260948.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

/**
 * ORIGINAL CODE SNIPPET FOR RESTORATION:
 * 
 * In StarField.jsx, replace the single background URL with:
 * 
 * const [dayOfWeek, setDayOfWeek] = useState(0);
 * 
 * // In useEffect for checkDayNight:
 * setDayOfWeek(now.getDay());
 * 
 * // Day background - changes based on day of week:
 * const dayBackground = {
 *   backgroundImage: `url('${dayBackgrounds[dayOfWeek]}')`,
 *   backgroundSize: '100% 100%',
 *   backgroundPosition: 'center center',
 *   backgroundRepeat: 'no-repeat',
 * };
 */

// Night background (galaxy/nebula) - stays the same
export const nightBackgroundUrl = "https://images.unsplash.com/photo-1638189330012-44e36a97312a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxkZWVwJTIwcHVycGxlJTIwbmVidWxhJTIwc3BhY2UlMjBiYWNrZ3JvdW5kJTIwc2VhbWxlc3MlMjB0ZXh0dXJlfGVufDB8fHx8MTc3MjY5MTg5Mnww&ixlib=rb-4.1.0&q=85";
