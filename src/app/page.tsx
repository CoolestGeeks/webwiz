
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { sendToWebhookAction } from './actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles, Copy } from 'lucide-react'; // Added Sparkles and Copy icons

// Define the Zod schema for form validation
const formSchema = z.object({
  sentence: z.string().min(1, 'Please enter a sentence.'),
  style: z.string().min(1, 'Please select a style.'),
});

type FormData = z.infer<typeof formSchema>;

const styleOptions = [
  'Gen Z',
  'Academic',
  'British slang',
  'Valley Girl',
  'Pirate',
  'Caveman',
  'Robot',
  'Overly Dramatic',
];

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [styledSentence, setStyledSentence] = React.useState<string | null>(
    null
  ); // State for styled sentence (HTML)
  const [selectedStyleName, setSelectedStyleName] = React.useState<string | null>(null); // State for the selected style name

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: '',
      style: '',
    },
  });

  // Function to copy text to clipboard
  const copyToClipboard = (htmlContent: string | null) => {
    if (!htmlContent) return;

    // Create a temporary element to parse HTML and extract text
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    const textToCopy = tempElement.textContent || tempElement.innerText || '';

    if (!textToCopy) {
        toast({
            variant: 'destructive',
            title: 'Copy Failed',
            description: 'Could not extract text from the styled output.',
        });
        return;
    }


    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: 'Copied!',
          description: 'Styled text copied to clipboard.',
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        toast({
            variant: 'destructive',
          title: 'Copy Failed',
          description: 'Could not copy text to clipboard.',
        });
      });
  };


  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setStyledSentence(null); // Clear previous output on new submission
    setSelectedStyleName(null); // Clear previous style name
    try {
      const result = await sendToWebhookAction(values);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your sentence has been sent and styled.',
        });
        if (result.styledSentence) {
           setStyledSentence(result.styledSentence);
           setSelectedStyleName(values.style); // Set the selected style name
        } else {
             setStyledSentence("<p class='text-muted-foreground'>Styling process initiated. The result should appear here if the webhook returns it. If not, check your n8n workflow configuration to ensure it responds with the styled sentence.</p>");
             console.warn("Webhook succeeded but did not return a styled sentence.");
        }
        // Don't reset the form immediately to allow viewing input/output
        // form.reset();
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.message || 'There was a problem sending your request.',
      });
       setStyledSentence(null); // Clear output on error
       setSelectedStyleName(null); // Clear style name on error
    } finally {
      setIsSubmitting(false);
    }
  }

   // Function to clear the form and the output
  const handleClear = () => {
    form.reset();
    setStyledSentence(null);
    setSelectedStyleName(null);
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground">WebForm Wizard</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your sentence, choose a style, and see the magic happen!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Output Preview Section */}
          {styledSentence && (
             <Card className="mb-6 border-primary/50 bg-primary/5 shadow-md">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center text-primary">
                   <Sparkles className="mr-2 h-5 w-5" /> {selectedStyleName ? `${selectedStyleName} Styled Output` : 'Styled Output'}
                </CardTitle>
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(styledSentence)}
                    aria-label="Copy styled output"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                 >
                    <Copy className="h-4 w-4" />
                 </Button>
              </CardHeader>
              <CardContent>
                {/* Use dangerouslySetInnerHTML to render HTML */}
                <div
                  className="text-foreground prose prose-sm max-w-none dark:prose-invert" // Added prose for basic HTML styling
                  dangerouslySetInnerHTML={{ __html: styledSentence }}
                />
              </CardContent>
            </Card>
          )}

          {/* Input Form Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Sentence</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your sentence here..."
                        className="resize-none min-h-[100px]" // Slightly reduced height
                        {...field}
                        aria-label="Sentence Input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose Style</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // Ensure value is controlled
                      aria-label="Style Selection"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {styleOptions.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="flex justify-between p-0 pt-6">
                 <Button type="button" variant="outline" onClick={handleClear} disabled={isSubmitting}>
                   Clear
                 </Button>
                 <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-accent text-primary-foreground">
                    {isSubmitting ? 'Styling...' : 'Style Sentence'}
                    {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                  </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

