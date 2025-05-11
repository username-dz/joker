import React, { createContext, useState, ReactNode } from "react";

interface MiniEditorContextType {
  showMiniEditor: boolean;
  setShowMiniEditor: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  position: { x: number; y: number };
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  size: { width: number; height: number };
  setSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >;
}

export const MiniEditorContext = createContext<MiniEditorContextType>({
  showMiniEditor: false,
  setShowMiniEditor: () => {},
  activeTab: "text",
  setActiveTab: () => {},
  position: { x: 20, y: 100 },
  setPosition: () => {},
  size: { width: 300, height: 400 },
  setSize: () => {},
});

interface MiniEditorProviderProps {
  children: ReactNode;
}

export const MiniEditorProvider = ({ children }: MiniEditorProviderProps) => {
  const [showMiniEditor, setShowMiniEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [size, setSize] = useState({ width: 300, height: 400 });

  return (
    <MiniEditorContext.Provider
      value={{
        showMiniEditor,
        setShowMiniEditor,
        activeTab,
        setActiveTab,
        position,
        setPosition,
        size,
        setSize,
      }}
    >
      {children}
    </MiniEditorContext.Provider>
  );
};
