const format = require('./format');
const pluralize = require('pluralize');
const fs = require('fs');

function buildForSchemaVersionNew(schema, args) {

    let index = '';
    const dir = args['--outDir'] + '/';
    let moduleExports = '';
    schema.models.forEach((model) => {
        // console.log('-----SCHAME--', model);





        let fileContent = '';
        if (args['--js']) {
            index += `...require('./${model.name}'),`;
        } else {
            index += `export * from './${model.name}';`;
        }
        fileContent = `${args['--js'] ? 'const' : 'import'} { inputObjectType, objectType${args['--mq'] || args['-q'] || args['-m'] ? ', extendType' : ''
            } } ${args['--js'] ? `= require('@nexus/schema')` : ` from '@nexus/schema'`
            };
      
            `;
        fileContent += `const { SortOrder } = require('../prismaContext/public');
        
        `;

        fileContent += `${args['--js'] ? '' : 'export '}const ${model.name} = objectType({
            name: '${model.name}',
            definition(t) {`;
        moduleExports = `	${model.name},`;
        model.fields.forEach((field) => {
            fileContent += `
                            t.model.${field.name}()`;
        });
        fileContent += `
            },
            });
            
            `;


        // fileContent += `const ${model.name}SortOrder = enumType({
        //     name: 'SortOrder',
        //     members: ['asc', 'desc'],
        //     description: 'Schema Order By ASC OR DESC',
        // });

        // `;


        fileContent += `${args['--js'] ? '' : 'export '}const InputType = inputObjectType({
                        name: '${model.name}OrderByInput',
                        definition(t) {`;
        moduleExports = `	${model.name},`;
        model.fields.forEach((field) => {
            fileContent += `
                                    t.field('${field.name}',{ type: SortOrder })`;
        });
        fileContent += `
        },
        });
        
        `;



        const newName = model.name.charAt(0).toLowerCase() + model.name.slice(1);
        const namePlural = model.name.charAt(0).toUpperCase() + model.name.slice(1);
        const modelName = {
            plural: pluralize(newName),
            singular: newName,
            newPlural: pluralize(namePlural)
        };

        let AggregateType = ''
        let argsAggre = ''
        for (let item of model.fields) {
            if (item.type === 'Int' || item.type === 'Float') {
                argsAggre += `t.field('${item.name}', { type: 'Boolean' })
        `

            }
        }
        if (argsAggre != '') {
            AggregateType = `const ${modelName.singular}AggreType = inputObjectType({
        name: '${modelName.singular}AggreByInput',
        definition(t) {
          `+ argsAggre + `
        }
      });
      
      `;
        }

        fileContent += AggregateType
        // console.log('----fileContent', fileContent);
        // console.log('-----AggregateType', AggregateType);
        // console.log('---MODELNAME--', modelName);
        let queryCount = ''
        let queryConnect = ''
        let queryBase = ''
        let queryBases = ''
        let queryAggregate = ''


        if (args['--cn']) {
            queryBase = `t.field('${modelName.singular}', {
                type: '${model.name}',
                args: {
                  where: '${model.name}WhereInput',
                },
                async resolve(_root, args, ctx) {
                  return await ctx.prisma.${modelName.singular}.findOne(args);
                },
              })`
            queryBases = `t.list.field('${modelName.plural}', {
                type: '${model.name}',
                args: {
                  where: '${model.name}WhereInput',
                  orderBy: InputType,
                  skip: 'Int',
                  first: 'Int',
                  last: 'Int',
                  before: '${model.name}WhereUniqueInput',
                  after: '${model.name}WhereUniqueInput',
                },
                async resolve(_root, args, ctx) {
                  let argsNew = {
                    where: args.where,
                    orderBy: args.orderBy,
                    skip: args.skip,
                    cursor: args.before ? args.before : args.after ? args.after : undefined,
                    take: args.first ? args.first : args.last ? args.last : undefined,
                  }
                  return await ctx.prisma.${modelName.singular}.findMany(argsNew);
                },
              })`
        }





        if (args['-c']) {
            queryCount = `
      t.field('${modelName.plural}Count', {
        type: 'Int',
        args: {
          where: '${model.name}WhereInput',
        },
        async resolve(_root, args, ctx) {
          return ctx.prisma.${modelName.singular}.count(args)
        },
      })`;
        }

        if (args['--cn']) {
            queryConnect = `
      t.list.field('${modelName.plural}Connection',{
        type: '${model.name}',
        args: {
          where: '${model.name}WhereInput',
          orderBy: InputType,
          skip: 'Int',
          first: 'Int',
          last: 'Int',
          before: '${model.name}WhereUniqueInput',
          after: '${model.name}WhereUniqueInput',
        },
        async resolve(_root, args, ctx) {
          let argsNew = {
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            cursor: args.before ? args.before : args.after ? args.after : undefined,
            take: args.first ? args.first : args.last ? args.last : undefined
          }
          return await ctx.prisma.${modelName.singular}.findMany(argsNew);
        },
      })`;


        }

        if (AggregateType != '') {
            queryAggregate = `
      t.field('${modelName.plural}Aggregate', {
        type: 'Float',
        args: {
          where: '${model.name}WhereInput',
          orderBy: InputType,
          before: '${model.name}WhereUniqueInput',
          after: '${model.name}WhereUniqueInput',
          first: 'Int',
          last: 'Int',
          skip: 'Int',
          avg: ${modelName.singular}AggreType,
          max: ${modelName.singular}AggreType,
          min: ${modelName.singular}AggreType,
          sum: ${modelName.singular}AggreType
        },
        async resolve(_root, args, ctx) {
          let argsNew = {
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            cursor: args.before ? args.before : args.after ? args.after : undefined,
            take: args.first ? args.first : args.last ? args.last : undefined,
            min: args.min ? args.min : undefined,
            max: args.max ? args.max : undefined,
            avg: args.avg ? args.avg : undefined,
            sum: args.sum ? args.sum : undefined
          }
          return ctx.prisma.user.aggregate(argsNew)
        },
      })
      `
        }

        if (args['--mq'] || args['-q']) {
            fileContent += `

${args['--js'] ? '' : 'export '}const ${modelName.singular}Query = extendType({
  type: 'Query',
  definition(t) {
    
${queryBase}
${queryBases}
${queryCount}
${queryConnect}
${queryAggregate}
  },
})`;
            moduleExports += `
	${modelName.singular}Query,`;
        }
        if (args['--mq'] || args['-m']) {
            fileContent += `

${args['--js'] ? '' : 'export '}const ${modelName.singular
                }Mutation = extendType({
  type: 'Mutation',
  definition(t) {

    t.crud.createOne${model.name}({
      alias: 'create${model.name}'
    })
    t.crud.updateOne${model.name}({
      alias: 'update${model.name}'
    })
    t.crud.upsertOne${model.name}({
      alias: 'upsert${model.name}'
    })
    t.crud.deleteOne${model.name}({
      alias: 'delete${model.name}'
    })

    t.crud.updateMany${model.name}({
      alias: 'updateMany${modelName.newPlural}'
    })
    t.crud.deleteMany${model.name}({
      alias: 'deleteMany${modelName.newPlural}'
    })
  },
})`;
            moduleExports += `
	${modelName.singular}Mutation,`;
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (args['--js']) {
            fileContent += `
module.exports = {
${moduleExports}
}`;
        }
        fs.writeFile(
            dir + model.name + (args['--js'] || args['--mjs'] ? '.js' : '.ts'),
            format(fileContent, args['--js'] || args['--mjs']),
            () => { }
        );
    });
    if (args['--js']) {
        index = `module.exports = {
${index}}`;
    }
    fs.writeFile(
        dir + `index.${args['--js'] || args['--mjs'] ? 'js' : 'ts'}`,
        format(index, args['--js'] || args['--mjs']),
        () => { }
    );
}

module.exports = buildForSchemaVersionNew;
