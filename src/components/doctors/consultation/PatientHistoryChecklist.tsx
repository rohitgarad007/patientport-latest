import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, ChevronDown, Info, X } from "lucide-react";
import { PatientHistoryCategory, PatientHistoryItem } from "@/lib/consultation-data";
import { motion, AnimatePresence } from "framer-motion";

interface PatientHistoryChecklistProps {
  categories: PatientHistoryCategory[];
  selectedItems: string[];
  onToggleItem: (itemId: string) => void;
  highlightedItems?: string[];
}

const PatientHistoryChecklist = ({
  categories,
  selectedItems,
  onToggleItem,
  highlightedItems = []
}: PatientHistoryChecklistProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.map(c => c.id));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const getSelectedItemNames = () => {
    const names: string[] = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (selectedItems.includes(item.id)) {
          names.push(item.name);
        }
      });
    });
    return names;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">📋</span>
          Patient History Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Items Chips */}
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2"
            >
              {getSelectedItemNames().map((name, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-2 py-1 text-xs cursor-pointer hover:bg-secondary/80"
                >
                  {name}
                  <X className="h-3 w-3 ml-1" onClick={() => {
                    const item = categories.flatMap(c => c.items).find(i => i.name === name);
                    if (item) onToggleItem(item.id);
                  }} />
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <ScrollArea className="h-80">
          <div className="space-y-2 pr-4">
            <TooltipProvider>
              {filteredCategories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={expandedCategories.includes(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="font-medium text-foreground">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.items.filter(i => selectedItems.includes(i.id)).length}/{category.items.length}
                        </Badge>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedCategories.includes(category.id) ? "rotate-180" : ""
                      }`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-4 py-2 space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            highlightedItems.includes(item.name) 
                              ? "bg-warning/10 border border-warning/30" 
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <Checkbox
                            id={item.id}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => onToggleItem(item.id)}
                          />
                          <label
                            htmlFor={item.id}
                            className="flex-1 text-sm text-foreground cursor-pointer"
                          >
                            {item.name}
                          </label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{item.description}</p>
                            </TooltipContent>
                          </Tooltip>
                          {highlightedItems.includes(item.name) && (
                            <Badge className="text-xs bg-warning/20 text-warning border-warning/30">
                              Suggested
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TooltipProvider>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PatientHistoryChecklist;
