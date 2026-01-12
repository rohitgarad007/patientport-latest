import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Sparkles, TestTube } from "lucide-react";
import { LabTestOption } from "@/lib/consultation-data";
import { motion, AnimatePresence } from "framer-motion";

interface LabTestSelectorProps {
  labTests: LabTestOption[];
  selectedTests: string[];
  onToggleTest: (testId: string) => void;
  suggestedTests?: string[];
}

const LabTestSelector = ({
  labTests,
  selectedTests,
  onToggleTest,
  suggestedTests = []
}: LabTestSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredTests = useMemo(() => {
    if (!searchQuery) return labTests;
    return labTests.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.panelName && t.panelName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, labTests]);

  const getSelectedNames = () => {
    return labTests.filter(t => selectedTests.includes(t.id)).map(t => t.name);
  };

  const getPanels = () => {
    const panels = new Map<string, LabTestOption[]>();
    labTests.forEach(test => {
      if (test.panelName) {
        if (!panels.has(test.panelName)) {
          panels.set(test.panelName, []);
        }
        panels.get(test.panelName)!.push(test);
      }
    });
    return panels;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">🔬</span>
          Lab Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggested Tests */}
        <AnimatePresence>
          {suggestedTests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Recommended Tests</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedTests.map((testName, idx) => {
                  const test = labTests.find(t => t.name === testName);
                  const isSelected = test && selectedTests.includes(test.id);
                  return (
                    <Badge
                      key={idx}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${isSelected ? "" : "hover:bg-accent/10"}`}
                      onClick={() => {
                        if (test) onToggleTest(test.id);
                      }}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      {testName}
                      {isSelected && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getSelectedNames().map((name, idx) => (
              <Badge
                key={idx}
                className="px-2 py-1 text-xs bg-accent text-accent-foreground cursor-pointer"
              >
                {name}
                <X className="h-3 w-3 ml-1" onClick={() => {
                  const t = labTests.find(test => test.name === name);
                  if (t) onToggleTest(t.id);
                }} />
              </Badge>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests or panels..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
        </div>

        {/* Panel Suggestions */}
        <div className="flex flex-wrap gap-2">
          {Array.from(getPanels().entries()).slice(0, 4).map(([panelName, tests]) => (
            <Badge
              key={panelName}
              variant="outline"
              className="cursor-pointer hover:bg-muted text-xs"
              onClick={() => {
                tests.forEach(t => {
                  if (!selectedTests.includes(t.id)) {
                    onToggleTest(t.id);
                  }
                });
              }}
            >
              📦 {panelName}
            </Badge>
          ))}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ScrollArea className="h-48 rounded-lg border bg-card">
                <div className="p-2 space-y-1">
                  {filteredTests.map((test) => {
                    const isSelected = selectedTests.includes(test.id);
                    const isSuggested = suggestedTests.includes(test.name);
                    return (
                      <button
                        key={test.id}
                        className={`w-full p-3 rounded-lg text-left transition-all hover:bg-muted/80 ${
                          isSelected ? "bg-accent/10 border border-accent/20" : ""
                        } ${isSuggested && !isSelected ? "bg-primary/5" : ""}`}
                        onClick={() => onToggleTest(test.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground text-sm">{test.name}</p>
                            <p className="text-xs text-muted-foreground">{test.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{test.category}</Badge>
                            {isSuggested && <Sparkles className="h-3 w-3 text-primary" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default LabTestSelector;
