import Image from 'next/image'
import bioImage from '../../public/bio-img.png'
import { PageContainer } from '@/components/PageContainer'

export default function About() {
  return (
    <PageContainer>
      <h1 className='font-frogmore mb-8 text-4xl tracking-widest sm:text-6xl'>ABOUT</h1>
      <div className='items-start gap-8 lg:flex'>
        <Image src={bioImage} alt='Photo of Ariel Khawly' width={600} className='mb-5 lg:mb-0' />
        <div>
          <p className='mb-5'>
            Ariel Khawly started writing online in 2011 as a moderately popular Tumblr blogger,
            eventually crafting narratives and brand voices across advertising, public relations,
            creative strategy, and digital/print media. Growing up in Houston and attending an
            all-girls Catholic school where everyone wore Nike running shorts and oversized t-shirts
            in their free time, Ariel somehow became obsessed with clothes and talking about them.
            Inspiration grew from her mother’s recount of her time as a new-wave teenager in New
            York to Ariel’s own stint in The City as well as San Francisco, borrowing friends’
            clothes and cycling herwardrobe out on Haight Ashbury.
          </p>
          <p className='mb-5'>
            Ariel started selling vintage clothing in 2017 after a professor at The University of
            Texas said he couldn’t take her seriously because she wears “rags.” She was wearing a
            1969 Gunne Sax by Jessica McClintock at the time of this comment that was purchased for
            a mere $38. The estimated resale value of this piece in 2024 is $600. She has been
            published through the University of Southern California with her ultimate beginner’s
            guide to buying vintage and secondhand via thrift stores, curated shops, and digital
            resale platforms. Through Vintage for Y’all, Ariel has advocated for accessibility and
            transparency in the secondhand shopping experience, offering detailed accounts of each
            piece she sells, whether handmade or designer.
          </p>
          <p className='mb-5'>
            An advocate for fashion history and education, Ariel currently lives in LA and continues
            to yap about her love of clothes, new and old, through the lenses of (sub)culture,
            social media communities, and sustainability. She will always tell you the brand name
            and location of where she found an item if you ask or kindly compliment her on it.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
