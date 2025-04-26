
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
import { Send, Sparkles } from 'lucide-react'; // Added Sparkles icon

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
  ); // State for styled sentence

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: '',
      style: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setStyledSentence(null); // Clear previous output on new submission
    try {
      // Assuming the action now returns the styled sentence if successful
      const result = await sendToWebhookAction(values);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your sentence has been sent and styled.',
        });
        // Assuming the webhook response is included in the action result
        // The actual property name ('styled_sentence') depends on the webhook/n8n setup
        if (result.styledSentence) {
          setStyledSentence(result.styledSentence);
        } else {
             // Handle case where webhook didn't return the sentence as expected
             // This might happen if the n8n workflow doesn't return it in the response
             setStyledSentence("Styling process initiated. The result should appear here if the webhook returns it. If not, check your n8n workflow configuration to ensure it responds with the styled sentence.");
             console.warn("Webhook succeeded but did not return a styled sentence in the response.");
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
    } finally {
      setIsSubmitting(false);
    }
  }

   // Function to clear the form and the output
  const handleClear = () => {
    form.reset();
    setStyledSentence(null);
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
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-primary">
                   <Sparkles className="mr-2 h-5 w-5" /> Styled Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{styledSentence}</p>
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

