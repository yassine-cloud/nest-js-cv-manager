export class Cv {

    id: string;
    firstName: string;
    name: string;
    age: number;
    Cin: string;
    Job: string;
    path: string | null;
    userId: string;
    user?: { id: string, firstName: string, name: string, email: string };
    skills?: { id: string, designation: string }[];
}
