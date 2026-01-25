// UniversityLogoMap.js

import schoolIcon from '../../../school-icon.png'; // adjust the path as necessary

// Default icon for universities not found in the map
// eslint-disable-next-line no-unused-vars
const defaultUniversityIcon = "https://www.example.com/path/to/default-university-icon.png"; // replace with an actual icon URL

// Map of university names to their logo URLs
const universityLogos = new Map([
  ["Duke University", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Duke_Blue_Devils_logo.svg/1200px-Duke_Blue_Devils_logo.svg.png"],
  ["University of Southern California", "https://identity.usc.edu/wp-content/uploads/2022/09/TheSeal_Reg_0921.png"],
  ["University of Texas at Dallas", "https://upload.wikimedia.org/wikipedia/commons/7/7c/UT_Dallas_2_Color_Emblem_-_SVG_Brand_Identity_File.svg"],
  ["University of Virginia-Main Campus", "https://brand.virginia.edu/logo"],
  ["University of Washington", "https://www.washington.edu/brand/graphic-elements/logo/"],
  ["University of Western Ontario", "https://communications.uwo.ca/comms/brand/visual_identity.html"],
  ["University of the Sciences", "https://www.usciences.edu/marketing-communications/brand-guidelines/index.html"],
  ["University of the West of England, Bristol", "https://www.uwe.ac.uk/about/brand/logo"],
  ["Vanderbilt University", "https://www.vanderbilt.edu/communications/brand/logo/"],
  ["Virginia Polytechnic Institute and State University", "https://brand.vt.edu/visual-identity/brand-architecture/university-logos.html"],
  ["Virginia Tech", "https://brand.vt.edu/visual-identity/brand-architecture/university-logos.html"],
  ["Wake Forest University", "https://brand.wfu.edu/visual-identity/logos/"],
  ["Florida International University", "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/FIU_Panthers_logo.svg/320px-FIU_Panthers_logo.svg.png"],
  ["University of Chicago", "https://creative.uchicago.edu/files/2023/09/UChicago_Shield_1Color_Maroon_RGB.png"],
  ["The University of Chicago", "https://creative.uchicago.edu/files/2023/09/UChicago_Shield_1Color_Maroon_RGB.png"],
  ["University of Miami", "https://ucomm.miami.edu/_assets/images/tools-and-resources/signatures/png/um-informal-rgb.png"]
]);

// Function to get the logo URL by university name, or return the default icon if not found
export function getUniversityLogo(universityName) {
  return universityLogos.get(universityName) || schoolIcon;
}

export default universityLogos;
