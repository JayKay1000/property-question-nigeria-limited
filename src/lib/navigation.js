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
  { label: 'Landbanking', key: 'buy2flip', href: '/buy2flip' },
];