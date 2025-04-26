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
import { Send } from 'lucide-react';

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: '',
      style: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const result = await sendToWebhookAction(values);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your sentence has been sent for styling.',
        });
        form.reset(); // Reset form on success
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground">WebForm Wizard</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your sentence and choose a style to transform it!
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        className="resize-none min-h-[150px]"
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
                      defaultValue={field.value}
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
              <CardFooter className="flex justify-end p-0 pt-6">
                 <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-accent text-primary-foreground">
                    {isSubmitting ? 'Sending...' : 'Send Sentence'}
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
