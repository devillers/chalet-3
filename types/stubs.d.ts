// Local type stubs for third-party modules unavailable in the audit environment.
// Each declaration keeps the associated import typed as `any`, allowing the
// project to compile without the upstream packages.

declare module '@hookform/resolvers/zod' {
  export const zodResolver: any;
}
declare module '@radix-ui/react-accordion';
declare module '@radix-ui/react-alert-dialog';
declare module '@radix-ui/react-aspect-ratio';
declare module '@radix-ui/react-avatar';
declare module '@radix-ui/react-checkbox' {
  export type CheckedState = boolean | 'indeterminate';
  export const Root: any;
  export const Indicator: any;
}
declare module '@radix-ui/react-collapsible';
declare module '@radix-ui/react-context-menu';
declare module '@radix-ui/react-dialog' {
  export type DialogProps = Record<string, any>;
  export const Dialog: any;
  export const DialogContent: any;
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Close: any;
  export const Title: any;
  export const Description: any;
}
declare module '@radix-ui/react-dropdown-menu';
declare module '@radix-ui/react-hover-card';
declare module '@radix-ui/react-label';
declare module '@radix-ui/react-menubar';
declare module '@radix-ui/react-navigation-menu';
declare module '@radix-ui/react-popover';
declare module '@radix-ui/react-progress';
declare module '@radix-ui/react-radio-group';
declare module '@radix-ui/react-scroll-area';
declare module '@radix-ui/react-select';
declare module '@radix-ui/react-separator';
declare module '@radix-ui/react-slider';
declare module '@radix-ui/react-slot';
declare module '@radix-ui/react-switch';
declare module '@radix-ui/react-tabs';
declare module '@radix-ui/react-toast';
declare module '@radix-ui/react-toggle';
declare module '@radix-ui/react-toggle-group';
declare module '@radix-ui/react-tooltip';
declare module 'bcryptjs';
declare module 'better-sqlite3' {
  class Database {
    constructor(path: string, options?: any);
    pragma(statement: string): void;
    exec(sql: string): void;
    close(): void;
    prepare(sql: string): any;
  }

  namespace Database {
    interface Database {
      pragma(statement: string): void;
      exec(sql: string): void;
      close(): void;
      prepare(sql: string): any;
    }
  }

  export = Database;
}
declare module 'class-variance-authority' {
  export type VariantProps<T> = Record<string, any>;
  export function cva(base?: string, config?: any): (...inputs: any[]) => string;
}
declare module 'clsx' {
  export type ClassValue = any;
  export default function clsx(...values: any[]): string;
  export { clsx };
}
declare module 'cmdk' {
  export const Command: any;
}
declare module 'crypto';
declare module 'dotenv' {
  export function config(options?: any): { parsed?: Record<string, string> } | void;
}
declare module 'embla-carousel-react' {
  export type UseEmblaCarouselType = [React.RefCallback<any>, any];
  export default function useEmblaCarousel(options?: any, plugins?: any): UseEmblaCarouselType;
}
declare module 'framer-motion';
declare module 'input-otp';
declare module 'lucide-react' {
  export type LucideIcon = (props?: Record<string, any>) => any;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const Circle: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Loader2: LucideIcon;
  export const Award: LucideIcon;
  export const Shield: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const Home: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Calendar: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Camera: LucideIcon;
  export const Heart: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Globe: LucideIcon;
  export const Menu: LucideIcon;
  export const LogOut: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Image: LucideIcon;
  export const LogIn: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Upload: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const GripVertical: LucideIcon;
  export const Dot: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Search: LucideIcon;
  export const Mail: LucideIcon;
  export const Users: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Settings: LucideIcon;
  export const Mountain: LucideIcon;
  export const Phone: LucideIcon;
  export const MapPin: LucideIcon;
  export const Facebook: LucideIcon;
  export const Twitter: LucideIcon;
  export const Instagram: LucideIcon;
  export const Linkedin: LucideIcon;
  const icons: Record<string, LucideIcon>;
  export default icons;
}
declare module 'mongodb' {
  export type Db = {
    collection<T = any>(name: string): Collection<T>;
  } & Record<string, any>;
  export type Collection<T = any> = any;
  export type Filter<T = any> = any;
  export class MongoClient {
    constructor(uri: string, options?: any);
    connect(): Promise<this>;
    db(name?: string): Db;
    close(): Promise<void>;
  }
}
declare module 'next-auth' {
  export interface NextAuthOptions {
    providers?: any[];
    session?: any;
    callbacks?: any;
    pages?: Record<string, any>;
    secret?: string;
  }
  export interface DefaultSession {
    user?: Record<string, any>;
    expires?: string;
    [key: string]: any;
  }
  export function getServerSession(...args: any[]): Promise<any>;
  export default function NextAuth(options: NextAuthOptions): any;
}
declare module 'next-auth/react' {
  export function useSession(): { data: any; status: 'loading' | 'authenticated' | 'unauthenticated' };
  export function signIn(provider?: string, options?: any): Promise<any>;
  export const signOut: (options?: any) => Promise<any>;
  export function SessionProvider(props: { children: any; session?: any }): any;
}
declare module 'next-auth/providers/credentials' {
  export default function CredentialsProvider(options: any): any;
}
declare module 'next-auth/providers/google' {
  export default function GoogleProvider(options: any): any;
}
declare module 'next/font/google' {
  export function Roboto(options: any): any;
  export function Inter(options: any): any;
  export function Plus_Jakarta_Sans(options: any): any;
  export function Pacifico(options: any): any;
}
declare module 'next/image';
declare module 'next/link';
declare module 'next/navigation';
declare module 'next/script';
declare module 'next/server' {
  export type NextRequest = any;
  export const NextResponse: any;
}
declare module 'next-themes';
declare module 'node:buffer';
declare module 'node:crypto';
declare module 'nodemailer';
declare module 'path';
declare module 'react-day-picker';
declare module 'react-hook-form' {
  export type FieldValues = Record<string, any>;
  export type SubmitHandler<TFieldValues = FieldValues> = (values: TFieldValues, event?: any) => any;
  export interface UseFormReturn<TFieldValues = FieldValues> {
    handleSubmit: (...args: any[]) => any;
    control: any;
    reset: (...args: any[]) => void;
    setValue: (...args: any[]) => void;
    watch: any;
    register: (...args: any[]) => any;
    getValues: (...args: any[]) => any;
    trigger: (...args: any[]) => Promise<boolean>;
    setError: (...args: any[]) => void;
    clearErrors: (...args: any[]) => void;
    getFieldState: (...args: any[]) => any;
    formState: { errors: Record<string, any>; isSubmitting: boolean; [key: string]: any };
  }

  export function useForm<TFieldValues = FieldValues>(options?: any): UseFormReturn<TFieldValues>;
  export const Controller: (props: {
    control: any;
    name: string;
    defaultValue?: any;
    render: (context: { field: any; fieldState: any; formState: any }) => any;
  }) => any;
  export type UseFormWatch<TFieldValues = FieldValues> = (callback?: any) => any;
  export type FieldPath<TFieldValues = FieldValues> = string;
  export const FormProvider: any;
  export function useFormContext<TFieldValues = FieldValues>(): UseFormReturn<TFieldValues>;
  export type ControllerProps<TFieldValues = FieldValues, TName = string> = any;
}
declare module 'react-resizable-panels' {
  export const PanelGroup: any;
  export const Panel: any;
  export const PanelResizeHandle: any;
}
declare module 'recharts' {
  export type LegendProps = Record<string, any>;
  export const ResponsiveContainer: any;
  export const LineChart: any;
  export const Line: any;
  export const CartesianGrid: any;
  export const XAxis: any;
  export const YAxis: any;
  export const Tooltip: any;
  export const Legend: any;
}
declare module 'sonner' {
  export const Toaster: any;
}
declare module 'tailwind-merge' {
  export function twMerge(...inputs: any[]): string;
}
declare module 'tailwindcss' {
  export interface Config {
    content?: any;
    theme?: any;
    plugins?: any;
    [key: string]: any;
  }
}
declare module 'vaul';
declare module 'zod' {
  export type ZodSchema<T = any> = any;
  export type ZodTypeAny = any;
  export type ZodIssue = any;
  export type infer<T> = any;
  export const z: any;
  export namespace z {
    export type infer<T> = any;
  }
  export const object: any;
  export const string: any;
  export const number: any;
  export const boolean: any;
  export const array: any;
  export const coerce: any;
  export function refine(...args: any[]): any;
  const zod: any;
  export default zod;
}

declare namespace React {
  type ReactNode = any;
  type ReactElement<T = any> = any;
  type Key = string | number;

  interface Attributes {
    key?: Key;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  interface MutableRefObject<T> {
    current: T;
  }

  type RefCallback<T> = (instance: T | null) => void;
  type ForwardedRef<T> = RefCallback<T> | MutableRefObject<T | null> | null;
  type Ref<T> = ForwardedRef<T>;

  type ElementType = any;
  type ComponentType<P = {}> = FC<P> | (new (props: P) => any);
  type ComponentProps<T extends ElementType> = any;
  type ComponentPropsWithRef<T extends ElementType> = any;
  type ComponentPropsWithoutRef<T extends ElementType> = any;
  type ElementRef<T extends ElementType> = any;

  interface HTMLAttributes<T> extends Record<string, any> {}
  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {}
  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {}
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {}
  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {}
  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {}
  interface SVGProps<T> extends Record<string, any> {}
  interface CSSProperties extends Record<string, any> {}

  interface SyntheticEvent<T = Element, E = Event> {
    target: T;
    currentTarget: T;
    nativeEvent: E;
    preventDefault(): void;
    stopPropagation(): void;
  }

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
  interface DragEvent<T = Element> extends SyntheticEvent<T> {
    dataTransfer: any;
  }
  interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    key: string;
  }
  interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  interface MouseEvent<T = Element> extends SyntheticEvent<T> {}

  type PropsWithChildren<P> = P & { children?: ReactNode };

  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);

  type FC<P = {}> = (props: PropsWithChildren<P> & { key?: Key }) => ReactElement | null;

  function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  function forwardRef<T, P = {}>(render: (props: P, ref: ForwardedRef<T>) => ReactElement | null): any;
  function memo<T extends ComponentType<any>>(component: T): T;

  function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  interface Context<T = any> {
    Provider: any;
    Consumer: any;
    displayName?: string;
    _currentValue?: T;
  }

  function useContext<T = any>(context: Context<T> | any): T;
  function useTransition(): [boolean, (callback: () => void) => void];
  function useDeferredValue<T>(value: T): T;
  function createContext<T>(defaultValue: T): Context<T>;
  function useId(): string;

  const Fragment: any;
  const Suspense: any;
}

declare module 'react' {
  export = React;
}

declare module 'react-dom' {
  const ReactDOM: {
    createPortal: (...args: any[]) => any;
  };
  export = ReactDOM;
}

declare module 'react-dom/server' {
  const ReactDOMServer: any;
  export = ReactDOMServer;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}

declare namespace NodeJS {
  interface ProcessEnv extends Record<string, string | undefined> {}
  interface Process {
    env: ProcessEnv;
    exit(code?: number): void;
    exitCode?: number;
    cwd(): string;
  }
}

declare const process: NodeJS.Process;

declare function require(name: string): any;
