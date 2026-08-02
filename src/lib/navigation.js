export const navItems = [
  { label: 'Home', key: 'home', href: '/' },
  {
    label: 'Listings',
    key: 'properties',
    href: '/properties',
    mega: {
      sections: [
        {
          title: 'For Sale',
          links: [
            { label: 'Houses', href: '/properties?type=house' },
            { label: 'Apartments', href: '/properties?type=apartment' },
            { label: 'Land & Plots', href: '/properties?type=land' },
            { label: 'Commercial Spaces', href: '/properties?type=commercial' },
          ],
        },
        {
          title: 'By Location',
          links: [
            { label: 'Lekki', href: '/properties?loc=lekki' },
            { label: 'Ikoyi', href: '/properties?loc=ikoyi' },
            { label: 'Victoria Island', href: '/properties?loc=vi' },
            { label: 'Abuja', href: '/properties?loc=abuja' },
          ],
        },
        {
          title: 'Special',
          links: [
            { label: 'Luxury Homes', href: '/properties?tag=luxury' },
            { label: 'New Developments', href: '/properties?tag=new' },
            { label: 'Buy2Flip Deals', href: '/buy2flip' },
          ],
        },
      ],
    },
  },
  {
    label: 'Services',
    key: 'services',
    href: '/services',
    mega: {
      sections: [
        {
          title: 'Core Services',
          links: [
            { label: 'Real Estate Sales', desc: 'Buy and sell premium properties', href: '/services/sales' },
            { label: 'Construction', desc: 'World-class building solutions', href: '/services/construction' },
            { label: 'Property Management', desc: 'Comprehensive property care', href: '/services/management' },
            { label: 'Estate Development', desc: 'End-to-end development', href: '/services/development' },
          ],
        },
      ],
    },
  },
  {
    label: 'Projects',
    key: 'projects',
    href: '/projects',
    mega: {
      sections: [
        {
          title: 'Estate Projects',
          links: [
            { label: 'Ongoing', href: '/projects?status=ongoing' },
            { label: 'Completed', href: '/projects?status=completed' },
            { label: 'Upcoming', href: '/projects?status=upcoming' },
          ],
        },
      ],
    },
  },
  { label: 'Buy2Flip', key: 'buy2flip', href: '/buy2flip' },
  {
    label: 'Agents',
    key: 'agents',
    href: '/agents',
    mega: {
      sections: [
        {
          title: 'Agent Hub',
          links: [
            { label: 'Find an Agent', href: '/agents' },
            { label: 'Become an Agent', href: '/agents/register' },
            { label: 'Agent Portal', href: '/agent-portal' },
          ],
        },
      ],
    },
  },
  {
    label: 'Resources',
    key: 'resources',
    href: '/blog',
    mega: {
      sections: [
        {
          title: 'Knowledge Hub',
          links: [
            { label: 'Blog', href: '/blog' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Market Reports', href: '/blog?cat=reports' },
            { label: 'FAQ', href: '/faq' },
          ],
        },
      ],
    },
  },
  {
    label: 'Company',
    key: 'company',
    href: '/about',
    mega: {
      sections: [
        {
          title: 'About Us',
          links: [
            { label: 'Our Story', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ],
        },
      ],
    },
  },
];