import {   Parallax,
  ParallaxItem,
  PrallaxContainer,
 } from "@/components/ui/parallax";
import {StaggerText } from '@/components/ui/stagger-text'
import {Button } from '@/components/ui/button'

export default function DemoOne() {
  return (<Parallax className="h-[3200px] md:h-[2000px] p-12 text-black bg-white">
  <div className="sticky top-0 h-screen space-y-4 w-full flex flex-col justify-center items-center text-center">
        <StaggerText
        className="text-5xl font-bold tracking-tighter md:w-2/3 mx-auto"
        text="Creating brands that brings people to the shop"
        direction="z"
      />

        <p
          className="max-w-prose  "
        >
          Defining the brand’s unique value proposition and positioning it in
          the market, creating a brand identity that resonates with the target
          audience.
        </p>

          <Button className="bg-indigo-600 hover:bg-indigo-400" size="lg">Get Started</Button>
      </div>

      <PrallaxContainer className="flex flex-wrap justify-between gap-4 w-full">
        <ParallaxItem
          className="w-11/12 md:w-1/4 max-h-96"
          start={200}
          end={-200}
        >
          <img
            className="size-full object-cover object-[50%_50%]"
            src="https://images.unsplash.com/photo-1508849789987-4e5333c12b78?q=80&w=1593&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="street"
          />
        </ParallaxItem>

        <ParallaxItem
          className="w-11/12 md:w-1/4 max-h-96"
          start={500}
          end={20}
        >
          <img
            className="size-full object-cover object-[50%_50%]"
            src="https://images.unsplash.com/photo-1666053691228-5f2c957b1755?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="street"
          />
        </ParallaxItem>
        <ParallaxItem
          className="w-11/12 md:w-1/4 max-h-96"
          start={800}
          end={50}
        >
          <img
            className="size-full object-cover object-[50%_50%]"
            src="https://images.unsplash.com/photo-1705693346612-bbc9f38f1621?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="street"
          />
        </ParallaxItem>
        <ParallaxItem
          className="w-11/12 md:w-1/4 max-h-96"
          start={500}
          end={50}
        >
          <img
            className="size-full object-cover object-[50%_50%]"
            src="https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?q=80&w=706&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="street"
          />
        </ParallaxItem>

        <ParallaxItem
          className="w-11/12 md:w-1/4 max-h-96"
          start={800}
          end={70}
        >
          <img
            className="size-full object-cover object-[50%_50%]"
            src="https://images.unsplash.com/photo-1643451481461-f73ff49a3f93?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="street"
          />
        </ParallaxItem>
      </PrallaxContainer>
  </Parallax>
  );
}
