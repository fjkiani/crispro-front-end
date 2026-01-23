import { records, screening, user, apps, research, dna, aiAgent, search } from "../assets";
import { moatNavigationItems } from "./moatNavigation";

/**
 * Main Navigation Links - MOAT Only
 * 
 * This is the primary navigation used by Sidebar and Navbar.
 * Only includes MOAT production routes.
 * 
 * @deprecated For new code, use moatNavigationItems from './moatNavigation'
 * This export maintains backward compatibility
 */
export const navlinks = moatNavigationItems.map(item => ({
  name: item.name,
  imgUrl: item.imgUrl,
  link: item.link,
  label: item.label,
  description: item.description,
}));

// Export MOAT navigation
export { moatNavigationItems, getNavigationForPersona, getNavigationLabel } from "./moatNavigation";

// Legacy export for backward compatibility
export default navlinks;
