import UltraChatWindow from "@/components/home/chat/UltraChatWindow";

export default function ChatOnlyPage() {
  return (
    <div className="w-screen h-screen bg-background relative">
      <UltraChatWindow 
        isOpen={true} 
        onClose={() => {}} 
        className="fixed inset-0 w-full h-full rounded-none border-0 right-auto bottom-auto shadow-none" 
      />
    </div>
  );
}
