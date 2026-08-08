import React from 'react';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';

const leaders = [
  { name: 'Gbenga Adewumi', title: 'Founder & CEO', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/6aa919429_MD.png' },
  { name: 'Adenola O. Adebayo', title: 'Head of Compliance', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/c81437054_EngineerFemi.png' },
  { name: 'Mojisola Olamilekan', title: 'Accountant', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/b2e0c09f8_MJEdit.png' },
  { name: 'Korede Adeigbe', title: 'Web & Multimedia', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/b6af01226_KoredeEdit.png' },
  { name: 'Nancy Oremichen', title: 'Social Media', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/fdc257d52_NancyEdit.jpg' },
  { name: 'Yinusa Sunmola', title: 'Photography', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/386b921f7_YinusaEdit.jpg' },
  { name: 'Onyeka Onyekemeihia', title: 'Graphics Design', photo: 'https://media.base44.com/images/public/6a6f7e5cd57da090e5283ea3/6e367b5f0_OnyekaEdit.jpg' },
];

export default function LeadershipTeam() {
  return (
    <section className="bg-ice-50 section-pad py-16 lg:py-24">
      <div className="container-wide">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-3">Leadership Team</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Meet the experienced professionals guiding our vision.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
          {leaders.map((member) => (
            <Card key={member.name} className="overflow-hidden group hover:shadow-card-hover transition-shadow">
              <div className="aspect-[3/4] bg-gradient-to-br from-brand-100 to-ice-100 overflow-hidden">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fittingType="fill"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-heading font-semibold text-sm md:text-base leading-tight">{member.name}</h3>
                <p className="text-xs md:text-sm text-flame-600 font-medium mt-1">{member.title}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}