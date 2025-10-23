export const BlogSection = () => {
    return <section id="blog" className="w-full bg-transparent py-20 relative">
        <div className="container mx-auto px-4 grid grid-cols-2 items-center relative">
            {/* First third */}
            <div className="flex flex-col items-center w-full">
                <h1 className="text-center text-2xl font-bold">Jambot's Story</h1>
                <div className="w-full max-w-xl mx-auto px-4">
                    <p className="py-8 text-justify">
                    JamBot was originally conceived for participation in the Oregon Innovation Challenge. Through this program I received valuable mentorship and secured $5,000 in seed funding, which provided both the resources and the confidence to expand on my vision. What began as a concept quickly evolved into a functioning prototype: an AI-assisted music companion that generates real-time accompaniment tailored to a musician’s input.
                    </p>
                </div>
            </div>
            
            {/* Second third */}
            <div className="flex justify-center items-center">
                <img 
                    src="/oic_check_photo.jpeg"
                    alt="OIC Check Photo"
                    className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-cover rounded-full"
                />
            </div>
        </div>
    </section>
}