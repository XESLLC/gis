import Sequelize from 'sequelize';
import DataTypes from 'sequelize';
import express from 'express';
var app = express();
import cors from 'cors';
app.use(cors());
const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/gisDb');
// - models
const LandParcel = sequelize.define('LandParcel', {
  id: {
    type: Sequelize.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    validate: {
        notEmpty: true,
    },
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  width: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'land_parcel'
});

const Zone = sequelize.define('Zone', {
    id: {
        type: Sequelize.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    }
}, {
    tableName: 'zone'
});

const ZoningRule = sequelize.define('ZoningRule', {
    id: {
      type: Sequelize.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4, // was UUIDV4
      validate: {
          notEmpty: true,
      },
    },
    maxNumOfLevels: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    maxLotCoverage: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    frontSetBack: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    sideSetBack: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    rearSetBack: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    far: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    density: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minUnitSize: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minResParking: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minOfficeParking: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minCommParking: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
}, {
    tableName: 'zoning_rule'
});
// - associations

LandParcel.hasOne(Zone);
Zone.belongsTo(LandParcel)
Zone.sync();

Zone.hasOne(ZoningRule)
ZoningRule.belongsTo(Zone)
ZoningRule.sync()

sequelize.sync({force: true}).then(() => {
  app.listen(4000, () => {
    console.log(`Example app listening on port ${4000}!`)
  });
});

// localhost:4000/createLandParcelZoneAndZoneRule with headers (see readme)
app.post('/createLandParcelZoneAndZoneRule', async (req, res) => {
    console.log('starting createLandParcelZoneAndZoneRule')
    const args = req.headers
    let newLandParcel
    const createLandParcelZoneAndZoneRule = async (req) => {

        newLandParcel = await LandParcel.create({
            area: args.area,
            width: args.width,
            length: args.length
        }).catch(function (err) {
            console.log('Database Error',err)
            res.status(400).send(err.message)
        })

        const newZone = await Zone.create({
            LandParcelId: newLandParcel.id
        }).catch(function (err) {
            console.log('Database Error',err)
            res.status(400).send(err.message)
        })

        const newZoneRule = await ZoningRule.create({
            ZoneId: newZone.id,
            maxNumOfLevels: args.max_num_of_levels,
            maxLotCoverage: args.max_lot_coverage,
            frontSetBack: args.front_set_back,
            sideSetBack: args.side_set_back,
            rearSetBack: args.rear_set_back,
            far: args.far,
            density: args.density,
            minUnitSize: args.min_unit_size,
            minResParking: args.min_res_parking,
            minOfficeParking: args.min_office_parking,
            minCommParking: args.min_comm_parking
        }).catch(function (err) {
            console.log('Database Error',err)
            res.status(400).send(err.message)
        })
    }
    await createLandParcelZoneAndZoneRule();
    console.log('results', newLandParcel.id) // use this id below in CalcMaxDevCapAllowed
    res.status(200).send(newLandParcel.id)
})

// localhost:4000/CalcMaxDevCapAllowed with headers -> id:[id from api createLandParcelZoneAndZoneRule ] residential_density: [do_not_round], lodging_density: [do_not_round]
app.get('/CalcMaxDevCapAllowed', async (req, res) => {
    console.log('starting CalcMaxDevCapAllowed')
    const args = req.headers
    console.log(args)
    let result = {
        maximum_footprint: 0,
        maximum_footprint_description: 'lot coverage is the restrictive regulation',
        maximum_capacity: 0,
        maximum_capacity_description: 'far is the restrictive regulation',
        maximum_dwelling_units:0,
        maximum_dwelling_units_description: 'minimum unit size is the restrictive regulations'
    }
    let parcel
    const calcMaxDevCapAllowed = async (req) => {

      parcel = await LandParcel.findOne({
          where: { id: args.id},
          include: [{
              model: Zone,
              include: [{
                  model: ZoningRule
              }]
          }]
      }).catch(function (err) {
          console.log('Database Error',err)
          res.status(400).send(err.message)
      })
      const rule = parcel.Zone.ZoningRule.dataValues

      const maxFootprintByCoverage = (parcel.area * rule.maxLotCoverage) / 100 //max lot coverage is a percent
      const maxFootprintBySetback = (parcel.length - rule.frontSetBack - rule.rearSetBack) * (parcel.width - (rule.sideSetBack * 2))
      result.maximum_footprint = maxFootprintByCoverage <= maxFootprintBySetback?  maxFootprintByCoverage : maxFootprintBySetback

      const maxCapacityByFar = parcel.area * rule.far
      const maxCapacityByBulk = rule.maxNumOfLevels * result.maximum_footprint
      result.maximum_capacity = maxCapacityByFar <= maxCapacityByBulk?  maxCapacityByFar : maxCapacityByBulk;

      const maxUnitsByDensityPreRound = (parcel.area / 43560) * rule.density
      let maxUnitsByDensity
      if (args.residential_density == 'round_up') {
          maxUnitsByDensity = Math.ceil(maxUnitsByDensityPreRound);
      } else if (args.residential_density == 'round_down') {
          maxUnitsByDensity = Math.floor(maxUnitsByDensityPreRound)
      } else if (args.residential_density == 'round') {
          maxUnitsByDensity = Math.round(maxUnitsByDensityPreRound)
      } else if (args.residential_density == 'do_not_round'){
          maxUnitsByDensity = (parcel.area / 43560) * rule.density
      } else {
          res.status(400).send('please provide residental calculation conficuration round_up, round_down, round or do_not_round')
      }
      const maxUnitsByBulk = Math.ceil((result.maximum_capacity/rule.minUnitSize))
      result.maximum_dwelling_units = maxUnitsByDensity <= maxUnitsByBulk?  maxUnitsByDensity : maxUnitsByBulk

      console.log(maxFootprintByCoverage, maxFootprintBySetback, maxCapacityByFar, maxCapacityByBulk, maxUnitsByDensity, maxUnitsByBulk, result )
    }
    await calcMaxDevCapAllowed();
    res.status(200).send(result)
})
