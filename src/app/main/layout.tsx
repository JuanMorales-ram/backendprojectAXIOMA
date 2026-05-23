import Menu, { navItems} from "@/app/components/Menu"


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return  (
    <div className="flex h-screen overflow-hidden bg-white">
     <Menu navItems={navItems} className=""></Menu>
      <div className="flex flex-col w-full h-screen overflow-y-auto py-19 px-25">{children}</div>
      
      </div>
    );
  }

