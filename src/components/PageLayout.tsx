export const PageLayout = (props: { children: React.ReactNode }) => (
    <div className={"container mx-auto h-screen flex flex-col p-4"}>
        <h1 className="font-sans text-4xl mx-auto pb-3">Simple Habits</h1>
        {props.children}
    </div>
)